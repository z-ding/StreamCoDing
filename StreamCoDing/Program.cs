using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization;
using MongoDB.Bson;
using MongoDB.Driver;
using StreamCoDing.Repositories;
using StreamCoDing.Settings;
using StreamCoDing.Controllers;
using StreamCoDing.Hubs;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 100000000000; // or specify a maximum size in bytes
});
// Add services to the container.
BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
BsonSerializer.RegisterSerializer(new DateTimeOffsetSerializer(BsonType.String));
builder.Services.AddSingleton<IMongoClient>(ServiceProvider => {
    var settings = builder.Configuration.GetSection(nameof(MongoDbSettings)).Get<MongoDbSettings>();
    return new MongoClient(settings.ConnectionString);
});
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<CppController>();
builder.Services.AddSingleton<IItemsRepository, MongoDbItemsRepository>();
builder.Services.AddSingleton<IPeopleRepository, MongoDbPeopleRepository>();
//builder.Services.AddSingleton<IItemsRepository, InMemItemsRepository>();
builder.Services.AddSignalR();
var app = builder.Build();

app.UseCors(policy =>
{
    policy.WithOrigins("https://localhost:44420")
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials();
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapHub<ChatHub>("/chatHub");//map the chathub to the endpoint
app.MapFallbackToFile("index.html"); ;

app.Run();
