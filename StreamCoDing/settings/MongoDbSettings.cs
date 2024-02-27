namespace StreamCoDing.Settings
{
    public class MongoDbSettings
    {
        public string Host { get; set; }
        public string Port { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
        public string ConnectionString
        {
            get
            {
                return $"mongodb://{User}:{Password}@{Host}:{Port}";
            }
        }
    }
}
/*
set secret:
don't do it in production version!!
1. database side:
open a terminal type docker ps to check whether there is a container running
if yes type docker stop mongo to stop it
type docker volume ls to check the volume we have
type docker volume rm mongodbdata (volumename) to delete the volume
set up the volume again
 docker run -d --rm --name mongo -p 27017:27017 -v mongodbdata:/data/db -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo

2. service side:
add "User" in appasetting.json under mongosettings
open a terminal
type in dotnet user-secrets init
a user secretid will be added in .csproj file
type in terminal: dotnet user-secrets set MongoDbSettings:Password admin123

3. read the secret in mongodbsettings
*/
