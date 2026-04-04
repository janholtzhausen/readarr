# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /build
COPY src/  src/
COPY Logo/  Logo/
RUN dotnet publish src/NzbDrone.Console/Readarr.Console.csproj \
      --configuration Release --framework net10.0 --runtime linux-x64 \
      --self-contained true -maxcpucount:$(nproc) -p:EnableAnalyzers=false \
      -p:EnforceCodeStyleInBuild=false \
      -p:Optimize=true -p:PublishReadyToRun=true -p:PublishReadyToRunShowWarnings=false \
      -p:DebugSymbols=false -p:DebugType=none -p:EmbedAllSources=false \
      -p:UseAVX=true -p:UseAES=true -p:UseSSE=true -p:UseSSE2=true \
      -p:UseSSE3=true -p:UseSSSE3=true -p:UseSSE41=true -p:UseSSE42=true \
      -p:UsePOPCNT=true -p:UsePCLMUL=true \
      --output /app/bin && \
    dotnet publish src/NzbDrone.Mono/Readarr.Mono.csproj \
      --configuration Release --framework net10.0 --runtime linux-x64 \
      --self-contained false -maxcpucount:$(nproc) -p:EnableAnalyzers=false \
      -p:EnforceCodeStyleInBuild=false \
      -p:DebugSymbols=false -p:DebugType=none -p:EmbedAllSources=false \
      -p:UseAVX=true -p:UseAES=true -p:UseSSE=true -p:UseSSE2=true \
      -p:UseSSE3=true -p:UseSSSE3=true -p:UseSSE41=true -p:UseSSE42=true \
      -p:UsePOPCNT=true -p:UsePCLMUL=true \
      --output /app/bin

FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY package.json package-lock.json .npmrc ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --loglevel=error
COPY frontend/ frontend/
COPY tsconfig.json ./
RUN npm run build

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
    DOTNET_EnableAVX=1 \
    DOTNET_EnableAES=1 \
    DOTNET_EnablePOPCNT=1 \
    DOTNET_EnablePCLMUL=1 \
    DOTNET_EnableSSE=1 \
    DOTNET_EnableSSE2=1 \
    DOTNET_EnableSSE3=1 \
    DOTNET_EnableSSSE3=1 \
    DOTNET_EnableSSE41=1 \
    DOTNET_EnableSSE42=1 \
    DOTNET_GCServer=0 \
    DOTNET_GCConserveMemory=0 \
    DOTNET_GCHeapHardLimit=0 \
    DOTNET_GCHeapHardLimitPercent=0 \
    QT_QPA_PLATFORM=offscreen \
    READARR__APP__DATADIR=/config \
    METADATA_URL=https://hardcover.bookinfo.pro
VOLUME ["/config", "/books"]
EXPOSE 8787
ENTRYPOINT ["/app/Readarr", "-nobrowser", "-data=/config"]
