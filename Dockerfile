FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn test
RUN yarn prettier --check .
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 3000
EXPOSE 3001


CMD [ "yarn", "dev" ]