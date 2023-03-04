import { MigrationInterface, QueryRunner } from "typeorm";

export class newMigration1677900172601 implements MigrationInterface {
    name = 'newMigration1677900172601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`refresh\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_94f168faad896c0786646fa3d4\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`login\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`secret\` int NOT NULL, \`rating\` int NOT NULL DEFAULT '10', \`isReferal\` tinyint NOT NULL DEFAULT 0, \`isLoyal\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 0, \`level\` int NOT NULL DEFAULT '1', \`referalsCount\` int NOT NULL DEFAULT '0', \`lastActionsDate\` datetime NULL, \`country\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`refererId\` int NULL, UNIQUE INDEX \`IDX_a62473490b3e4578fd683235c5\` (\`login\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`FK_94f168faad896c0786646fa3d4a\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_84c12626778431b3d99749469a8\` FOREIGN KEY (\`refererId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_84c12626778431b3d99749469a8\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`FK_94f168faad896c0786646fa3d4a\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_a62473490b3e4578fd683235c5\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_94f168faad896c0786646fa3d4\` ON \`token\``);
        await queryRunner.query(`DROP TABLE \`token\``);
    }

}
