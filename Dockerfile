# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /build
COPY src/  src/
COPY Logo/  Logo/
RUN dotnet publish src/NzbDrone.Console/Readarr.Console.csproj \
      --configuration Release --framework net10.0 --runtime linux-x64 \
      --self-contained true -maxcpucount:48 -p:EnableAnalyzers=false \
      -p:EnforceCodeStyleInBuild=false \
      -p:Optimize=true -p:PublishReadyToRun=true -p:PublishReadyToRunShowWarnings=false \
      -p:DebugSymbols=false -p:DebugType=none -p:EmbedAllSources=false \
      --output /app/bin && \
    dotnet publish src/NzbDrone.Mono/Readarr.Mono.csproj \
      --configuration Release --framework net10.0 --runtime linux-x64 \
      --self-contained false -maxcpucount:48 -p:EnableAnalyzers=false \
      -p:EnforceCodeStyleInBuild=false \
      -p:DebugSymbols=false -p:DebugType=none -p:EmbedAllSources=false \
      --output /app/bin

FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 300000
COPY frontend/ frontend/
COPY tsconfig.json ./
RUN yarn build

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0 AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
      calibre \
      calibre-bin \
      sqlite3 \
      curl \
      tzdata && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend-build /app/bin ./
COPY --from=frontend-build /frontend/_output/UI ./UI/
ENV DOTNET_TC_QuickJit=1 \
    DOTNET_TC_QuickJitForLoops=1 \
    DOTNET_TieredPGO=1 \
    DOTNET_ReadyToRun=1 \
    DOTNET_EnableAVX2=1 \
    DOTNET_EnableAES=1 \
    DOTNET_GCServer=0 \
    DOTNET_GCConserveMemory=0 \
    QT_QPA_PLATFORM=offscreen \
    READARR__APP__DATADIR=/config
VOLUME ["/config", "/books"]
EXPOSE 8787
ENTRYPOINT ["/app/Readarr", "-nobrowser", "-data=/config"]
