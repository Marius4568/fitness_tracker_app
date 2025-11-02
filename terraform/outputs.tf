# Outputs display important information after Terraform creates your infrastructure
# These values will be shown in the terminal and can be referenced by other tools

# The public IP address of the EC2 instance
# This is what you'll use to access your application in a web browser
output "instance_public_ip" {
  description = "Elastic IP address (permanent)"
  value       = aws_eip.fitness_tracker_eip.public_ip
}

output "elastic_ip" {
  description = "Elastic IP address"
  value       = aws_eip.fitness_tracker_eip.public_ip
}

# The instance ID is useful for reference in the AWS console
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.fitness_tracker.id
}

# The security group ID in case you need to modify rules later
output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.fitness_tracker_sg.id
}

# SSH connection command ready to copy and paste
# This makes it easy to connect to your instance
output "ssh_connection_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i fitness-tracker-key.pem ubuntu@${aws_instance.fitness_tracker.public_ip}"
}

# URL to access your application
output "application_url" {
  description = "URL to access the fitness tracker application"
  value       = "http://${aws_instance.fitness_tracker.public_ip}"
}

output "ansible_inventory_location" {
  description = "Location of auto-generated Ansible inventory"
  value       = abspath(local_file.ansible_inventory.filename)
}