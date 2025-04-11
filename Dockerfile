FROM node:20


WORKDIR /srv
COPY . .
RUN npm install
RUN npm run db:migrate

ENTRYPOINT [ "bash", "entry.sh" ]
