import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {

    let pokemon: Pokemon;
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id })
    }

    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ no: id.toLowerCase().trim() })
    }

    if (!pokemon) {
      throw new NotFoundException(`no exite ${id}`)
    }

    return pokemon
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (error) {
      this.handleException(error)
    }

  }
  async remove(id: string) {

    //const result = this.pokemonModel.findByIdAndDelete(id)
    const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({_id: id})

    if (deletedCount === 0) {
      throw new BadRequestException(`no existe ${id}`)
    }
    return acknowledged;
    
    

  }

  private handleException(error: any) {

    if (error.code === 11000) {
      throw new BadRequestException(`el Pokemon ya existe ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException('no puedo crear el pokemon - Verifica errores del servidor')
  }
}
