// ! farklı dosyalardan gelen veriler
import { getStorage, setStorage, icons, userIcon } from "./helpers.js";

//!  html elemanlarını çağırma
const form = document.querySelector("form");
const noteList = document.querySelector("ul");
const input = document.querySelector('form #title');
const cancelBtn = document.querySelector('form #cancel');
const expandBtn = document.querySelector('#checkbox');
const aside = document.querySelector('.wrapper');

//! global değişkenler (kodun her yerinden erişilebilen)
let coords;
let notes = getStorage() || []; // veriler null yerine boş dizi olarak gelsin
let markerLayer = null;
let map;

// * haritayı ekrana basan bir fonksiyon
function loadMap(coords) {
    map = L.map('map').setView(coords, 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// imleçleri tutacağımız ayrı bir katman oluşturma
markerLayer = L.layerGroup().addTo(map)

// kullanıcının konumuna imleç bas
L.marker(coords, { icon: userIcon }).addTo(map);

// local den gelen verileri bas
renderNoteList(notes);

// haritadaki tıklanma olaylarını izle
map.on('click', onMapClick);
}

// * kullanıcının konumunu alma
navigator.geolocation.getCurrentPosition(
    // konum alırsa çalışacak fonksiyon
    (e) => {
        loadMap([e.coords.latitude,e.coords.longitude]);
    },
    // konumu alamazsa çalışacak fonksiyon
    () => {
        loadMap([39.953925, 32.858552]);
    }
);
// * haritadaki tıklanma olaylarında çalıştır
function onMapClick(event) {
    // tıklanan yerin konumuna eriş global değişkene aktar
    coords = [event.latlng.lat, event.latlng.lng];

    // formu göster
    form.style.display = "flex";

    // ilk inputa aktar
    form[0].focus();
}
//* iptal butonuna tıklanırsa formu temizle ve kapat
    form[4].addEventListener("click", () => {
        //  formu temizle
        form.reset();
        //  formu kapat
        form.style.display = "none";
    })

    // * form gönderilirse yeni bir not oluştur ve storage'a kaydet
    form.addEventListener("submit", (e) => {
        // 1) sayfanın yenilenmesini engelle
        e.preventDefault();

        // 2) inputlardaki verilerden bir not objesi oluştur
        const newNote = {
            id: new Date().getTime(),
            title: form[0].value,
            date: form[1].value,
            status: form[2].value,
            coords: coords,
        }

        // 3) dizinin başına yeni notu ekle
        notes.unshift(newNote);
        
        // 4) notları ekrana bas
        renderNoteList(notes);

        // 5) loacal storage'ı güncelle
        setStorage(notes);

        // 6) formu kapat
        form.style.display = "none";
        form.reset();
    })

    // * ekrana notları basar
    function renderNoteList(items) {
        // önceden eklenen elemanları temizle
        noteList.innerHTML = "";
        markerLayer.clearLayers();

        // dizideki her bir obje için not kart bas
        items.forEach((note) => {
            // li elemanı oluştur
            const listEle = document.createElement('li');

            // data-id ekle
            listEle.dataset.id = note.id;
            // içeriğini belirle
            listEle.innerHTML = `
                    <div class="info">
                        <p>${note.title}</p>
                        <p>
                            <span>Tarih:</span>
                            <span>${note.date}</span>
                        </p>
                        <p>
                            <span>Durum:</span>
                            <span>${note.status}</span>
                        </p>
                    </div>
                    <div class="icons">
                        <i id="fly" class="bi bi-airplane-fill"></i>
                        <i id="delete" class="bi bi-trash3-fill"></i>
                    </div>
            `
            // html deki elemanı listeye ekle
            noteList.appendChild(listEle);

            // elemanı haritaya ekle
            renderMarker(note)
        });
    }

    // not için imleç katmanına yeni bir imleç ekler
    function renderMarker(note) {
        // imleç oluştur
        L.marker(note.coords, {icon: icons[note.status]})
        // imlece katmana ekle
        .addTo(markerLayer)
        .bindPopup(note.title);
    }

    // silme ve uçuş
    noteList.addEventListener("click", (e) => {
        // tıklanılan elemanın ıd sine erişme
        const found_id = e.target.closest("li").dataset.id

        if(e.target.id === "delete" && confirm("Silme işlemini onaylıyor musunuz?")) {
            // id sini bildiğimiz elemanı diziden çıkart
            notes = notes.filter((note) => note.id != found_id);

            // local i güncelle
            setStorage(notes);

            // ekranı güncelle
            renderNoteList(notes);

        }
        if(e.target.id === "fly") {
            // id sini bildiğimiz elemanı dizideki haline erişme
            const note = notes.find((note) => note.id == found_id);

            // not un koordinatlarına git
            map.flyTo(note.coords);
        }
    })
    //! Gizle / Göster
    checkbox.addEventListener('input', (e) => {
    const isChecked = e.target.checked;
  
    if (isChecked) {
      aside.classList.remove('hide');
    } else {
      aside.classList.add('hide');
    }
  });