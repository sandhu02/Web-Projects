FROM node

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=qwerty

RUN mkdir -p testServer

COPY . /testServer

CMD ["node","/testServer/index.js"]