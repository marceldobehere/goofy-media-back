FROM node:20


WORKDIR /srv
COPY . .
RUN npm install

ENTRYPOINT [ "bash", "entry.sh" ]