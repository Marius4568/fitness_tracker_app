[fitness_tracker]
${host_ip}

[fitness_tracker:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${key_file}
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
environment=${environment}
