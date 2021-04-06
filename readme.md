# books-finder by Mihajlo Nikolic

REST API and server side rendered website, both on same server

## Opis

Pretrazivac knjiga koji vrsi pretragu na sajtovima za prodaju knjiga. Za sada obavlja pretrage na delfi.rs, knjizare-vulkan.rs, evrobook.rs korisnaknjiga.com. Rezultate pretrage analizira i prepoznaje knjige koje su iste, a dolaze sa razlicitih satjova, zatim vrsi grupisanje i izbacuje tabelarni prikaz cena. Postoji mogucnost kreiranja akaunta i dodavanja knjiga u listu zelja. Vrsi pamcenje prepoznatih istih knjiga i belezi ih u bazi podataka radi boljih performansi prilikom svakog sledeceg pretrazivanja. Servis za slanje mailova je SendGrid.

Aplikacija je hostovana na Heroku (Free Dynos)

## Tehnologije

Node.js, Express.js, Mongoose, Pug
