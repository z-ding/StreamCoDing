# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80

# Copy the published web API project to the container's working directory
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["StreamCoDing.csproj", "./"]
RUN dotnet restore "StreamCoDing/StreamCoDing.csproj"
COPY . .
WORKDIR "/src/StreamCoDing"
RUN dotnet build "StreamCoDing.csproj" -c Release -o /app/build

# Publish the compiled C# project
FROM build AS publish
RUN dotnet publish "StreamCoDing.csproj" -c Release -o /app/publish

# Build runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StreamCoDing.dll"]