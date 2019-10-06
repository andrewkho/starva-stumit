# base image
FROM node:latest

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json package.json
RUN npm install -g
RUN npm install react-scripts@3.0.1 -g
RUN npm rebuild node-sass

# start app
CMD ["npm", "start"]
