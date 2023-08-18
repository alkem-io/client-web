#!/bin/bash

# Based on: https://vitejs.dev/guide/troubleshooting.html

# Increase file descriptor limit by ulimit
echo "Checking current file descriptor limit..."
ulimit -Sn

echo "Changing file descriptor limit temporarily..."
ulimit -Sn 10000

# Check current inotify limits
echo "Checking current inotify limits..."
sysctl fs.inotify

# Change inotify limits temporarily
echo "Changing inotify limits temporarily..."
sudo sysctl fs.inotify.max_queued_events=16384
sudo sysctl fs.inotify.max_user_instances=8192
sudo sysctl fs.inotify.max_user_watches=524288

# Update systemd config files
echo "Updating systemd config files..."
FILES=("/etc/systemd/system.conf" "/etc/systemd/user.conf")
KEY="DefaultLimitNOFILE"
VALUE="65536"

for file in "${FILES[@]}"; do
    # Uncomment the line if it exists and set the value
    sudo sed -i "s/#${KEY}=.*/${KEY}=${VALUE}/" "$file"

    # Check if the key exists and if not, append it
    if ! grep -q "${KEY}=" "$file"; then
        echo "${KEY}=${VALUE}" | sudo tee -a "$file" > /dev/null
    fi
done

# For Ubuntu Linux, update /etc/security/limits.conf
if grep -q "Ubuntu" /etc/os-release; then
    echo "Detected Ubuntu. Updating /etc/security/limits.conf..."
    echo "* - nofile 65536" | sudo tee -a /etc/security/limits.conf > /dev/null
fi

echo "All done! You might want to restart your system for changes to take effect."
