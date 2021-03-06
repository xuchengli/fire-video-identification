FROM node
MAINTAINER li xu cheng "lixucheng@aliyun.com"
# Compile and install FFmpeg
# Reference <https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu>
RUN apt-get update
RUN apt-get -y install autoconf automake build-essential libass-dev libfreetype6-dev \
    libsdl2-dev libtheora-dev libtool libva-dev libvdpau-dev libvorbis-dev libxcb1-dev libxcb-shm0-dev \
    libxcb-xfixes0-dev pkg-config texinfo wget zlib1g-dev
RUN mkdir ~/ffmpeg_sources
RUN apt-get -y install yasm
RUN cd ~/ffmpeg_sources \
    && wget http://www.nasm.us/pub/nasm/releasebuilds/2.13.01/nasm-2.13.01.tar.bz2 \
    && tar xjvf nasm-2.13.01.tar.bz2 \
    && cd nasm-2.13.01 \
    && ./autogen.sh \
    && PATH="$HOME/bin:$PATH" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" \
    && PATH="$HOME/bin:$PATH" make \
    && make install
RUN apt-get -y install libx264-dev
RUN apt-get -y install cmake mercurial \
    && cd ~/ffmpeg_sources \
    && hg clone https://bitbucket.org/multicoreware/x265 \
    && cd ~/ffmpeg_sources/x265/build/linux \
    && PATH="$HOME/bin:$PATH" cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" \
        -DENABLE_SHARED:bool=off ../../source \
    && make \
    && make install
RUN cd ~/ffmpeg_sources \
    && wget -O fdk-aac.tar.gz https://github.com/mstorsjo/fdk-aac/tarball/master \
    && tar xzvf fdk-aac.tar.gz \
    && cd mstorsjo-fdk-aac* \
    && autoreconf -fiv \
    && ./configure --prefix="$HOME/ffmpeg_build" --disable-shared \
    && make \
    && make install
RUN apt-get -y install libmp3lame-dev
RUN apt-get -y install libopus-dev
RUN apt-get -y install libvpx-dev
RUN cd ~/ffmpeg_sources \
    && wget http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 \
    && tar xjvf ffmpeg-snapshot.tar.bz2 \
    && cd ffmpeg \
    && PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
         --prefix="$HOME/ffmpeg_build" \
         --pkg-config-flags="--static" \
         --extra-cflags="-I$HOME/ffmpeg_build/include" \
         --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
         --bindir="$HOME/bin" \
         --enable-gpl \
         --enable-libass \
         --enable-libfdk-aac \
         --enable-libfreetype \
         --enable-libmp3lame \
         --enable-libopus \
         --enable-libtheora \
         --enable-libvorbis \
         --enable-libvpx \
         --enable-libx264 \
         --enable-libx265 \
         --enable-nonfree \
    && PATH="$HOME/bin:$PATH" make \
    && make install \
    && hash -r
ENV FFMPEG_PATH /root/bin/ffmpeg
ENV FFPROBE_PATH /root/bin/ffprobe

# Before webpack app in production, you can set context path using <docker build --build-arg context=[my-context-path]>
# or set AI VISION API using <docker build --build-arg context=[my-context-path] --build-arg api=[special-api]>
ARG context=/
ARG api=https://crl.ptopenlab.com:8800/dlaas/api
ENV Context_Path $context
ENV AI_VISION_API $api

# Build and start up app
RUN mkdir -p /usr/app/src
COPY . /usr/app/src
WORKDIR /usr/app/src
RUN npm install && npm cache clean --force
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
