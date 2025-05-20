import { renderAllEventCards } from "./EventCard.js";

let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("EventsDB", 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            const usersStore = db.createObjectStore("Users", { keyPath: "user_id", autoIncrement: true });
            usersStore.createIndex("email", "email", { unique: true });

            const eventsStore = db.createObjectStore("Events", { keyPath: "event_id", autoIncrement: true });
            eventsStore.createIndex("date", "date");
            eventsStore.createIndex("place", "place");
            eventsStore.createIndex("name", "name");
            eventsStore.createIndex("description", "description");
            eventsStore.createIndex("photo", "photo");
            eventsStore.createIndex("time_start", "time_start");
            eventsStore.createIndex("time_end", "time_end");
            eventsStore.createIndex("organizer_id", "organizer_id");
            eventsStore.createIndex("is_organizer", "is_organizer");
            eventsStore.createIndex("category", "category");
            eventsStore.createIndex("is_child_friendly", "is_child_friendly");
            eventsStore.createIndex("additional_comment", "additional_comment");
            eventsStore.createIndex("rating", "rating");
            eventsStore.createIndex("user_id", "user_id");

            const reviewsStore = db.createObjectStore("Reviews", { keyPath: "review_id", autoIncrement: true });
            reviewsStore.createIndex("user_id", "user_id");
            reviewsStore.createIndex("event_id", "event_id");
            reviewsStore.createIndex("rating", "rating");
            reviewsStore.createIndex("comment", "comment");
            reviewsStore.createIndex("created_at", "created_at");

            const notificationsStore = db.createObjectStore("Notifications", { keyPath: "notification_id", autoIncrement: true });
            notificationsStore.createIndex("user_id", "user_id");
            notificationsStore.createIndex("event_id", "event_id");
            notificationsStore.createIndex("message", "message");
            notificationsStore.createIndex("is_read", "is_read");
            notificationsStore.createIndex("created_at", "created_at");

            const favoritesStore = db.createObjectStore("Favorites", { keyPath: "favorite_id", autoIncrement: true });
            favoritesStore.createIndex("user_id", "user_id");
            favoritesStore.createIndex("event_id", "event_id");

            const subscriptionsStore = db.createObjectStore("Subscriptions", { keyPath: "subscription_id", autoIncrement: true });
            subscriptionsStore.createIndex("user_id", "user_id");
            subscriptionsStore.createIndex("organizer_id", "organizer_id");
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            // console.log("База данных успешно создана или открыта:", db)
            // deleteEvents()
            readEvents()
            resolve(db)
        }

        request.onerror = function (event) {
            console.error("Ошибка при открытии базы данных:", event.target.error)
            reject(event.target.error)
        }
    })
}

function addEvent(eventData) {
    const request = db.transaction(['Events'], 'readwrite')
        .objectStore('Events')
        .add(eventData)

    request.onsuccess = () => {
        console.log('Мероприятие было добавлено в базу данных');
    }

    request.onerror = (event) => {
        console.error('Ошибка при добавлении мероприятии', event.target.error)
    }
}

function addAllEvents(eventsData) {
    eventsData.forEach(eventData => {
        addEvent(eventData)
    });
}

function getEvents() {
    return new Promise((resolve, reject) => {
        const request = db.transaction('Events')
            .objectStore('Events')
            .getAll();

        request.onsuccess = () => {
            const events = request.result;
            resolve(events);
            console.log(events);
        };

        request.onerror = (event) => {
            console.error('Ошибка при получении мероприятий:', event.target.error);
            reject(event.target.error);
        };
    });
}

function readEvents() {
    const transaction = db.transaction(["Events"]);
    const objectStore = transaction.objectStore("Events");
    const request = objectStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            console.log(`ID: ${cursor.key}, Название: ${cursor.value.name}, Описание: ${cursor.value.description}`);
            cursor.continue();
        } else {
            console.log("Все мероприятия прочитаны.");
        }
    };
}

function deleteEvents() {
    const request = db.transaction(["Events"], "readwrite")
        .objectStore("Events")
        // .delete(id)
        .clear()

    request.onsuccess = () => {
        console.log("Мероприятие удалено.");
    };

    request.onerror = (event) => {
        console.error('Ошибка при удалении мероприятий:', event.target.error)
    }
}

export { initDatabase, addAllEvents, addEvent, getEvents }