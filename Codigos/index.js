#!/bin/node
const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'abascal';

const http = require('http');
const fs = require("fs");

const qs = require("querystring");

let db;
let collection;

async function db_connect() {
  await client.connect();
  console.log('Connected successfully to server');
  db = client.db(dbName);

  return 'Conectados a la base de datos MongoDB.';
}

db_connect()
        .then(console.log)
        .catch(console.error);

function send_characters (response) {
        collection = db.collection('characters');

        collection.find({}).toArray()
                .then(characters => {
                 console.log(characters);

                 let names = [];
                 for (let i = 0; i < characters.length; i++) {
                    names.push(characters[i].name);
                 }

                 response.write(JSON.stringify(names));
                 response.end();
                }
        );
}

function send_Age (response, url) {

        if (url.length < 3) {
                response.write("ERROR: La Edad no es correcta");
                response.end();
                return;
        }

        collection = db.collection('characters');

        collection.find({"name": url[2]}).project({_id: 0, age: 1}).toArray()
                .then(character => {

                        console.log(characters);

                        if (character.length == 0) {
                                response.write("ERROR: La Edad no es correcta");
                                response.end();
                                return;
                        }

                        response.write(JSON.stringify(character[0]));
                        response.end();
                }
        );
}

function send_characters_items (response, url) {

        let name = url[2].trim();

        if (name == "") {
                response.write("ERROR: URL no esta bien formada");
                response.end();
                return;
        }

        collection = db.collection('characters');

        collection.find({"name": name}).project({_id: 0, id: 1}).toArray()
                .then(character => {
                        if (character.length != 1) {
                                response.write("ERROR: el personaje " + name + " no existe");
                                response.end();
                                return;
                        }

                collection = db.collection("characters_items");

                collection.find({"id": id[0].id}).project({_id: 0, id_item: 1}).toArray()
                        .then(ids => {
                                console.log(ids);
                                if (ids.length == 0) {
                                        response.write("[]");
                                        response.end();
                                        return;
                                }
                        collection = db.collection("items");
                        let ids_items = [];
                        ids.forEach(element => ids_items.push(element.id_item));
                        collection.find({"id_item": {$in: ids_items} }).project({_id: 0, item: 1}).toArray()
                                .then(items => {
                                        let names = [];
                                        items_name.forEach(item => names.push(item.item));
                                        response.write(JSON.stringify(names));
                                        response.end();
                                        return;
                        });
                });
        });
}

function send_items (response) {

        if (url.length >= 3) {
                send_character_items(response, url);
                return;
        }
         collection = db.collection('items');

   collection.find({}).toArray()
                .then(items => {
        let items_name = [];
        for (let i = 0; i < items.length; i++) {
            items_name.push(items[i].item);
        }
         response.write(JSON.stringify(items_name));
         response.end();
      }
   );
}

function send_weapons (response) {

   collection = db.collection('weapons');
   collection.find({}).toArray()
    .then(weapons => {
    console.log(weapons);
    let weapons_name = [];

         for (let i = 0; i < weapons.length; i++) {
            weapons_name.push(weapons[i].weapon);
         }
         response.write(JSON.stringify(weapons_name));
         response.end();
      }
   );
}

function send_characters_data(response, id) {

        collection = db.collection('characters');

        collection.find({ "id": Number(id) }).project({ _id: 0 }).toArray()
                .then(character => {
                        response.write(JSON.stringify(character));
                        response.end();
                });
}

function insert_character (request, response) {
        if (request.method != "POST") {
                response.write("ERROR: El formulario no ha sido enviado");
                response.end();

                return;
        }

        let data = "";
        request.on('data', character_chunk =>   data += character_chunk);
        request.on('end', () => {
                console.log(data);
                let info = qs.parse(data);
                console.log(info);
                let collection = db.collection("characters");
                if (info.name == undefined) {
                        response.write("ERROR: Nombre no definido");
                        response.end();
                        return;
                }
                if (info.age == undefined) {
                        response.write("ERROR: Edad no definida");
                        response.end();
                        return;
                }
                let insert_info = {
                        name: info.name,
                        age: parseInt(info.age)
                };
                collection.insertOne(insert_info);
                response.write("Nuevo personaje " + insert_info.name + " insertado");
                response.end();
        });

}


http.createServer(function(request, response) {
                if (request.url) {
                        return;
                }
                console.log("Se estan conectando");
                let url = request.url.split("/");
                let params = request.url.split("?");
                switch (url[1]){
                        case "characters":
                                send_characters(response);
                                break;
                        case "age":
                                send_age(response, url);
                                break;
                        case "items":
                                if (url[1]) {
                                        send_character_items (response, url);
                                        break;
                                }
        send_items(response, url);
        break;
                        case "weapons":
                                send_weapons(response);
                                break;
                        case "character_form":
                                insert_character(request, response);
                                break;
                        default:
                                if (params[1]) {
                                        let parameter = params[1].split("=");
                                        let id_character = parameter[1];
                                        console.log(id_character);
                                        send_character_data(response, id_character);
                                        return;
                                }
                                fs.readFile("index.html", function(err, data) {
                                        if (err) {
                                                console.error(err);
                                                response.writeHead(404, {"Content-Type":"text/html"});
                                                response.write("Error: archivo no encontrado");
                                                response.end();
                                                return;
                                        }
                                        response.writeHead(200, {"Content-Type":"text/html"});
                                        response.write(data);
                response.end();
                                });
                }



console.log(request.url);

}
).listen(8080);