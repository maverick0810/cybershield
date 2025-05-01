run = ["bash", "start_servers.sh"]
language = "bash"

[nix]
channel = "stable-22_11"

[deployment]
run = ["bash", "start_servers.sh"]
deploymentTarget = "cloudrun"