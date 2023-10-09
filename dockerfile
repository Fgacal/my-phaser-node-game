# Utiliza una imagen base de Node.js
FROM node:14

# Crea un directorio de trabajo dentro del contenedor llamado "app"
WORKDIR /app

RUN apt install -yq git

RUN echo "source /root/.bash_aliases" >> /root/.bashrc
# Set a cool prompt
RUN echo "PS1='\[\033[1;32m\]🎮 [WebServerNode] [\u] [\w]\n\\$ \[\033[0m\]'"


# Install oh my git! terminal bash bar
RUN git clone https://github.com/jenhsun/oh-my-git-patched.git ~/.oh-my-git && echo source ~/.oh-my-git/prompt.sh >> /root/.bashrc

# Enable git completion
RUN echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc


# clone github repositorio
RUN git clone https://Fgalcal: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@github.com/Fgacal/my-phaser-node-game.git

# colores git en la terminal
RUN git config --global color.ui true

# Copia solo los archivos relacionados con la aplicación (excluyendo node_modules) al directorio de trabajo en el contenedor
COPY package*.json ./my-phaser-node-game
COPY index.js ./my-phaser-node-game
COPY .gitignore ./my-phaser-node-game
COPY public ./my-phaser-node-game/public
COPY ./dockerfile ./my-phaser-node-game

# Instala las dependencias del proyecto
RUN npm install

# Instala Phaser.js y lo guarda como una dependencia en el package.json
RUN npm install phaser --save

# Expone el puerto en el que tu aplicación Express escuchará (cambia este puerto si es necesario)
EXPOSE 3000

# Comando para arrancar el servidor con nodemon
CMD ["npx", "nodemon", "./my-phaser-node-game/index.js"]

#  docker build -t my-phaser-game . && docker run -d -p 3000:3000 my-phaser-node-game

