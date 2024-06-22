###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine

# Create a non-root user and switch to it
USER node

# Set NODE_ENV environment variable
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json ./

COPY --chown=node:node ./src ./src

COPY --chown=node:node ./nest-cli.json ./

COPY --chown=node:node ./tsconfig.build.json ./

COPY --chown=node:node ./tsconfig.json ./

COPY --chown=node:node ./.env ./


USER root
# Install NEST CLI
RUN npm install -g @nestjs/cli

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force  

# Run the build command which creates the production bundle
# RUN npm run build

# RUN npm run apply:migration

USER node

ENV PORT 3000
ENV PORT 9229

# Start the server using the production build
# CMD ["npm", "prod"]