FROM node:latest
WORKDIR /project
COPY . .
RUN npm i
EXPOSE 4000
CMD ["npm","run","dev","--host"]