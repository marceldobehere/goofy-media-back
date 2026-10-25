FROM node:22


WORKDIR /srv
COPY . .
RUN npm install

ENTRYPOINT [ "bash", "entry.sh" ]
