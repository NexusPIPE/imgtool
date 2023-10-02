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
pnpm i;

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
  echo "I give up - I don't know where your binary dir is"
  exit 1;
fi;

echo Installed! Run the 'imgtool' command to start;
