FROM node:carbon

LABEL maintainer="Robby Prima Suherlan robbyprima@gmail.com"

# App directory
WORKDIR /app

# Install ruby
RUN apt-get update
RUN apt-get install ruby-full -y

# Install plist gen
RUN gem install ipa_install_plist_generator

RUN yarn global add pm2

# App dependencies
COPY . .
COPY yarn.lock package.json ./
# speed up build by reading purely from lockfile and used previous yarn cache
RUN yarn --pure-lockfile --cache-folder /root/app/.yarn-cache

RUN yarn build

# Clean ups
RUN apt-get clean autoclean && \
  apt-get autoremove --yes && \
  rm -rf /var/lib/{apt,dpkg,cache,log}/

#Expose port and begin application
EXPOSE 3000

# Start the app
CMD [ "pm2-runtime", "start", "ecosystem.config.js"]
