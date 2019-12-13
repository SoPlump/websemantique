import {sparql} from "./main";

export const getGenreByName = name => {
    return sparql
        .query(`
            select ?res ?name ?abstract
            WHERE {
                ?res a yago:WikicatVideoGameGenres;
                rdfs:label ?name;
                dbo:abstract ?abstract.
                FILTER(LangMatches(lang(?name), "en"))
                FILTER(LangMatches(lang(?abstract), "en"))
                FILTER (?res = <http://dbpedia.org/resource/${name}>)
            }
        `)
        .then(res => {
            const genre = res.results.bindings[0];
            if(genre) {
                return new Promise(resolve => resolve({
                    abstract: genre.abstract.value,
                    name: genre.name.value,
                    uri: genre.res.value
                }));
            }
            return null;
        })
        .then(genre => {
            if(genre) {
                return sparql
                    .query(`
                    SELECT ?res ?name WHERE {
                        ?res a dbo:VideoGame;
                        dbo:genre ?genre;
                        rdfs:label ?name.
                        FILTER(?genre = <${genre.uri}>)
                        FILTER(LangMatches(lang(?name), "en"))
                    } LIMIT 10
                    `)
                    .then(res => {
                        const games = res.results.bindings;
                        return new Promise(resolve => resolve({
                            ...genre,
                            games: games.map(game => {
                                return {
                                    name: game.name.value,
                                    uri: game.res.value
                                }
                            })
                        }));
                    });
            }
            return null;
        })
        .catch(error => {
            /*eslint-disable no-console*/
            console.error(error);
        });
};

export const getAllGenresByName = name => {
    return sparql
        .query(`
            select ?res ?name ?abstract
            WHERE {
                ?res a yago:WikicatVideoGameGenres;
                rdfs:label ?name.
                FILTER(LangMatches(lang(?name), "en"))
                FILTER contains(lcase(?name), lcase("${name}"))
            }
        `)
        .then(res => {
            let genres = res.results.bindings;
            return new Promise(resolve => {
                genres = genres.map(genre => {
                    return {
                        name: genre.name.value,
                        res: genre.res.value
                    };
                });
                resolve(genres);
            });
        })
        .catch(error => {
            /*eslint-disable no-console*/
            console.error(error);
        });
};