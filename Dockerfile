FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./


RUN yarn install
RUN yarn test
RUN yarn prettier --check .

# Bundle app source
COPY . .

EXPOSE 3000
EXPOSE 3001

ENV NODE_ENV=PRODUCTION

CMD [ "yarn", "dev" ]