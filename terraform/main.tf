provider "aws" {
  region = "eu-north-1"
}

resource "aws_security_group" "my_security_group" {
  name        = "my_security_group"
  description = "Allow inbound traffic for SSH, frontend, and backend"

  # Allow SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  # Allow Frontend (5173)
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Backend (8800)
  ingress {
    from_port   = 8800
    to_port     = 8800
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "my_instance" {
  ami           = "ami-00da1738201099b91" 
  instance_type = "t3.micro"
  key_name      = "key1" 

  security_groups = [aws_security_group.my_security_group.name]

  tags = {
    Name = "MyEC2Instance"
  }
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker docker-compose
              systemctl start docker
              systemctl enable docker
              EOF
}

output "instance_public_ip" {
  value = aws_instance.my_instance.public_ip
}
