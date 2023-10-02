#!/bin/bash

BIN=$(pwd)/bin/imgtool # entrypoint

# Create bin dir
mkdir -p bin;

# Create entrypoint
echo "#!/bin/zsh
# imgtool.sh
export DIR=\$(pwd)
cd "$(pwd)"
pnpm start \$@" > $BIN
chmod +x $BIN;

# Install dependencies
if command -v pnpm &>/dev/null; then
  pnpm i;
  pnpm build;
else
  echo -e "\x1b[0;41m FATAL \x1b[0m\x1b[0;31m\x1b[0;41m\x1b[0m\x1b[0;31m\x1b[0m\x1b[0;31m\x1b[0m \x1b[0;93mPNPM\x1b[0m is not installed. Please install it from \x1b[0;94mhttps://pnpm.io/installation\x1b[0m"
  exit 1;
fi

# Link entrypoint
if [ -d "$HOME/.local/bin" ]; then
  # If possible, install into $HOME/.local/bin
  echo "Installing to ~/.local/bin"
  ln -s $BIN "$HOME/.local/bin/";
elif [ -d "$HOME/bin" ]; then
  # Otherwise, try $HOME/bin
  echo "Installing to ~/bin"
  ln -s $BIN "$HOME/bin/";
elif [ -d "$HOME/.bin" ]; then
  # What about $HOME/.bin?
  echo "Installing to ~/.bin"
  ln -s $BIN "$HOME/.bin/";
elif [ -d "/usr/bin" ]; then
  # Give up
  echo "Could not find binary directory in HOME - Installing to /usr/bin/" 1>&2;
  sudo ln -s $BIN "/usr/bin/";
else
  # Completely give up
  echo -e "\x1b[0;41m FATAL \x1b[0m I give up - I don't know where your binaries live. Please link \x1b[0;94m$BIN\x1b[0m to a file named '\x1b[0;92mimgtool\x1b[0m' in your bin dir";
  exit 1;
fi;

echo Installed! Run the 'imgtool' command to start;
