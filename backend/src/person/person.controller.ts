import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonType } from '../common/enums';

@Controller('persons')
@UseGuards(JwtAuthGuard)
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createDto: CreatePersonDto) {
    return this.personService.create(createDto);
  }

  @Get()
  findAll(@Query('tipo') tipo?: PersonType) {
    return this.personService.findAll(tipo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePersonDto) {
    return this.personService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }
}

