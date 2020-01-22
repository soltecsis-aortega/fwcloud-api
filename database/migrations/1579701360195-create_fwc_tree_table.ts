import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class createFwcTreeTable1579701360195 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

        //fwc_tree
        await queryRunner.createTable(new Table({
            name: 'fwc_tree',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: "45",
                    isNullable: false
                },
                {
                    name: 'id_parent',
                    type: 'int',
                    default: null,
                },
                {
                    name: 'node_order',
                    type: 'tinyint',
                    isNullable: false,
                    default: 0
                },
                {
                    name: 'node_type',
                    type: 'char',
                    length: "3",
                    default: null,
                },
                {
                    name: 'id_obj',
                    type: "int",
                    length: "11",
                    default: null
                },
                {
                    name: 'obj_type',
                    type: 'int',
                    length: '11',
                    default: null
                },
                {
                    name: 'fwcloud',
                    type: 'int',
                    length: '11',
                    default: null
                },
            ],
            uniques: [
                { columnNames: ['id_obj', 'obj_type', 'id_parent', 'nodE_type'] }
            ],
            foreignKeys: [
                {
                    columnNames: ['id_parent'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'fwc_tree'
                }
            ]
        }), true);

        //fwc_tree_node_types
        await queryRunner.createTable(new Table({
            name: 'fwc_tree_node_types',
            columns: [
                {
                    name: 'node_type',
                    type: 'char',
                    isPrimary: true,
                    isNullable: false
                },
                {
                    name: 'obj_type',
                    type: 'int',
                    length: '11',
                    default: null
                },
                {
                    name: 'api_call_base',
                    type: 'varchar',
                    length: '255',
                    default: null
                },
                {
                    name: 'order_mode',
                    type: 'tinyint',
                    length: '1',
                    isNullable: false,
                    default: 1,
                    comment: 'Node order: 1-NODE_ORDER, 2 - NAME',
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('fwc_tree_node_types', true);
        await queryRunner.dropTable('fwc_tree', true);
    }

}
