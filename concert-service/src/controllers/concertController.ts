import { Request, Response } from 'express';
import consertService from '../service/concertService';
import { ConcertInput } from '../types/concert';

export class ConcertController {

  async getAllConcerts(req: Request, res: Response): Promise<void> {
    try {
      const concerts = await consertService.findAll();
      res.json(concerts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getConcertById(req: Request, res: Response): Promise<void> {
    try {
      const concert = await consertService.findById(req.params.id);
      if (!concert) {
        res.status(404).json({ message: 'Concert not found' });
        return;
      }
      res.json(concert);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getAllConcertsAvailable(req: Request, res: Response): Promise<void> {
    try {
      const concerts = await consertService.findAllConcertsAvailable();
      res.json(concerts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async createConcert(req: Request, res: Response): Promise<void> {
    try {
      const concertData:  ConcertInput | ConcertInput[] = req.body;
      const newConcert = await consertService.create(concertData);
      res.status(201).json(newConcert);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async updateConcert(req: Request, res: Response): Promise<void> {
    try {
      const concertData: Partial<ConcertInput> = req.body;
      const concert = await consertService.update(req.params.id, concertData);
      if (!concert) {
        res.status(404).json({ message: 'Concert not found' });
        return;
      }
      res.json(concert);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async deleteConcert(req: Request, res: Response): Promise<void> {
    try {
      const concert = await consertService.delete(req.params.id);
      if (!concert) {
        res.status(404).json({ message: 'Concert not found' });
        return;
      }
      res.json({ message: 'Concert deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export default new ConcertController();