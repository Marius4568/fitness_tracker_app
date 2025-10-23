# Configure the AWS Provider
# This tells Terraform we want to create resources in AWS
# The region is where your resources will be physically located
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"  # Change this to your preferred region
}

# Create a security group that acts as a firewall for our EC2 instance
# This defines what network traffic is allowed to reach our server
resource "aws_security_group" "fitness_tracker_sg" {
  name        = "fitness-tracker-security-group"
  description = "Security group for fitness tracker application"

  # Allow SSH access so we can connect to the server
  # Port 22 is the standard SSH port
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from anywhere - in production, restrict this to your IP
  }

  # Allow HTTP traffic so users can access the web application
  # Port 80 is the standard HTTP port
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from anywhere - this is correct for public web apps
  }

  # Allow traffic on port 5000 for the backend API
  ingress {
    description = "Backend API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic so the server can download packages, Docker images, etc.
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"  # -1 means all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fitness-tracker-sg"
    Project = "fitness-tracker"
  }
}

# Create an SSH key pair that will be used to connect to the EC2 instance
# Terraform will create both the public key (stored in AWS) and private key (saved locally)
resource "tls_private_key" "fitness_tracker_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Register the public key with AWS so it can be used with EC2 instances
resource "aws_key_pair" "fitness_tracker_key" {
  key_name   = "fitness-tracker-key"
  public_key = tls_private_key.fitness_tracker_key.public_key_openssh

  tags = {
    Name = "fitness-tracker-key"
  }
}

# Save the private key to a local file so we can use it to SSH into the instance
# This file will be created in the terraform directory
resource "local_file" "private_key" {
  content         = tls_private_key.fitness_tracker_key.private_key_pem
  filename        = "${path.module}/fitness-tracker-key.pem"
  file_permission = "0400"  # Read-only for owner, which is required for SSH keys
}

# Create the EC2 instance that will host our application
# This is the actual virtual server where Docker will run
resource "aws_instance" "fitness_tracker" {
  # AMI ID for Ubuntu 24.04 in us-east-1
  # If you change the region above, you'll need to find the corresponding AMI ID for that region
  ami           = "ami-0a116fa7c861dd5f9"  # Ubuntu 24.04 LTS
  instance_type = "t2.medium"  # 2 vCPUs, 4GB RAM - enough for Docker containers

  # Associate the key pair so we can SSH into this instance
  key_name = aws_key_pair.fitness_tracker_key.key_name

  # Associate the security group to control network access
  vpc_security_group_ids = [aws_security_group.fitness_tracker_sg.id]

  # Root volume configuration - 20GB of storage
  root_block_device {
    volume_size = 16
    volume_type = "gp3"
    encrypted   = true  # Security best practice - encrypt the disk
  }

  # Tags help identify and organize resources in AWS
  tags = {
    Name    = "fitness-tracker-server"
    Project = "fitness-tracker"
    ManagedBy = "Terraform"
  }

  # This ensures the instance has a public IP address so we can access it from the internet
  associate_public_ip_address = true
}