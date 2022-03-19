FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

RUN yarn test
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 3001 3000
CMD [ "yarn", "dev" ]