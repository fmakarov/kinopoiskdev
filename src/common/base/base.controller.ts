import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor, Get, NotFoundException, Param, Query, UseInterceptors, Version } from '@nestjs/common';
import { IQuery } from '../interfaces/query.interface';
import { Paginated } from '../decorators/paginated.decorator';
import { ApiBaseResponse } from '../decorators/api-base-response.decorator';
import { ForbiddenErrorResponseDto } from '../dto/errors/forbidden-error.response.dto';

type Constructor<T> = new (...args: any[]) => T;

export function BaseController<TEntity, TEntityDto>(
  Entity: Constructor<TEntity>,
  EntityDto: Constructor<TEntityDto>,
  description?: string,
) {
  abstract class BaseController {
    protected constructor(readonly service: any) {}

    @Version('1')
    @Get()
    @ApiOperation({ summary: description })
    @UseInterceptors(CacheInterceptor)
    @Paginated(EntityDto, Entity, { findForAllProperties: true })
    async findManyByQuery(@Query() query: IQuery): Promise<TEntityDto> {
      return this.service.findMany(query);
    }
  }

  return BaseController;
}

export function BaseControllerWithFindById<TEntity, TEntityDto>(
  Entity: Constructor<TEntity>,
  EntityDto: Constructor<TEntityDto>,
  summary?: string,
  description?: string,
) {
  abstract class BaseControllerWithFindById {
    protected constructor(readonly service: any) {}

    @Version('1')
    @Get()
    @UseInterceptors(CacheInterceptor)
    @ApiOperation({ summary, description })
    @Paginated(EntityDto, Entity, { findForAllProperties: true })
    async findManyByQuery(@Query() query: IQuery): Promise<TEntityDto> {
      return this.service.findMany(query);
    }

    @Version('1')
    @Get(':id')
    @UseInterceptors(CacheInterceptor)
    @ApiOperation({ summary: 'Поиск по id', description: 'Возвращает всю доступную информацию о сущности.' })
    @ApiBaseResponse({ type: Entity })
    @ApiNotFoundResponse({ type: ForbiddenErrorResponseDto, description: 'NotFound' })
    async findOne(@Param('id') id: string): Promise<TEntity> {
      const found = await this.service.findOne(+id);
      if (!found) throw new NotFoundException('По этому id ничего не найдено!');

      return found;
    }
  }

  return BaseControllerWithFindById;
}
