import type { AppDaos } from '../daoFactory.ts'
import type { GenreRow } from '../dao/genreDao.ts'

export interface IGenreService {
  listGenres(): Promise<GenreRow[]>
  getById(id: string): Promise<GenreRow | undefined>
}

export class GenreService implements IGenreService {
  constructor(private readonly daos: AppDaos) {}

  async listGenres(): Promise<GenreRow[]> {
    return this.daos.genreDao.findAll()
  }

  async getById(id: string): Promise<GenreRow | undefined> {
    return this.daos.genreDao.findById(id)
  }
}
