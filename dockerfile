FROM node:20-alpine 

WORKDIR  /app

COPY . .


ENV MONGO_URI=mongodb://host.docker.internal:27017
ENV DB_NAME=ecommerce
RUN npm install

EXPOSE 4000
CMD [ "npm", "run" ,"dev" ]

