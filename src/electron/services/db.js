var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
var DbUtils = /** @class */ (function () {
    function DbUtils() {
    }
    DbUtils.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, artistTable, albumTable, songTable, insertedId, albumId, i, songId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = new Database('plootunes.sqlite', OPEN_CREATE | OPEN_READWRITE, function (err) {
                            if (err) {
                                return console.error(err.message);
                            }
                            console.log('Connected to the in-memory SQlite database.');
                        });
                        artistTable = "\n    CREATE TABLE IF NOT EXISTS artist (\n        id INTEGER PRIMARY KEY,\n        name TEXT\n    )\n  ";
                        albumTable = "\n      CREATE TABLE IF NOT EXISTS album (\n          id INTEGER PRIMARY KEY,\n          name TEXT,\n          artistId INTEGER,\n          FOREIGN KEY (artistId) REFERENCES artist(id)\n      )\n    ";
                        songTable = "\n      CREATE TABLE IF NOT EXISTS song (\n          id INTEGER PRIMARY KEY,\n          name TEXT,\n          albumId INTEGER,\n          FOREIGN KEY (albumId) REFERENCES album(id)\n      )\n  ";
                        db.serialize(function () {
                            db.run(artistTable, function (err) {
                                if (err) {
                                    return console.error(err.message);
                                }
                                console.log('Processed artist table.');
                            });
                            db.run(albumTable, function (err) {
                                if (err) {
                                    return console.error(err.message);
                                }
                                console.log('Processed album table.');
                            });
                            db.run(songTable, function (err) {
                                if (err) {
                                    return console.error(err.message);
                                }
                                console.log('Processed song table.');
                            });
                        });
                        return [4 /*yield*/, this.insertArtist(db, 'test artist 1')];
                    case 1:
                        insertedId = _a.sent();
                        console.log("awaited and inserted test artist: ".concat(insertedId));
                        return [4 /*yield*/, this.insertAlbum(db, 'test album 1', insertedId)];
                    case 2:
                        albumId = _a.sent();
                        console.log("awaited and inserted test test album: ".concat(insertedId));
                        i = 1;
                        _a.label = 3;
                    case 3:
                        if (!(i <= 10)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.insertSong(db, "test song ".concat(i), albumId)];
                    case 4:
                        songId = _a.sent();
                        console.log("awaited and inserted test song ".concat(i, ": ").concat(songId));
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        // close the database connection
                        db.close(function (err) {
                            if (err) {
                                return console.error(err.message);
                            }
                            console.log('Close the database connection.');
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    DbUtils.insertArtist = function (db, name) {
        return new Promise(function (resolve, reject) {
            var insertArtist = "INSERT INTO artist (name) values (?)";
            db.run(insertArtist, [name], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.lastID);
            });
        });
    };
    DbUtils.insertAlbum = function (db, name, artistId) {
        return new Promise(function (resolve, reject) {
            var insertArtist = "INSERT INTO album (name, artistId) values (?, ?)";
            db.run(insertArtist, [name, artistId], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.lastID);
            });
        });
    };
    DbUtils.insertSong = function (db, name, albumId) {
        return new Promise(function (resolve, reject) {
            var insertArtist = "INSERT INTO song (name, albumId) values (?, ?)";
            db.run(insertArtist, [name, albumId], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.lastID);
            });
        });
    };
    return DbUtils;
}());
export { DbUtils };
