import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAiAndAiModelsTables1732791730332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'ai_models',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'ai_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['ai_id'],
            referencedTableName: 'ai',
            referencedColumnNames: ['id'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'ai_credentials',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'api_key',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'model_id',
            type: 'int',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['model_id'],
            referencedTableName: 'ai_models',
            referencedColumnNames: ['id'],
          },
        ],
      }),
      true,
    );

    await queryRunner.query(`
      INSERT INTO ai (name) VALUES
      ('ChatGPT');
  `);

    await queryRunner.query(`
      INSERT INTO ai_models (name,ai_id) VALUES
      ('GPT-4',1),
      ('GPT-4-turbo',1),
      ('GPT-3.5-turbo',1),
      ('GPT-3.5-turbo-16k',1),
      ('DALL·E',1),
      ('Whisper',1);
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_credentials');

    await queryRunner.dropTable('ai');

    await queryRunner.dropTable('ai_models');
  }
}
