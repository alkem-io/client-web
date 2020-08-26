FROM node:12-alpine

# Create app directory
WORKDIR /app


# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY package-lock.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source & config files for TypeScript
COPY ./src ./src
COPY ./public ./public 
COPY ./tsconfig.json .
COPY ./codegen.yml .

EXPOSE 3000

CMD [ "npm", "start" ]
