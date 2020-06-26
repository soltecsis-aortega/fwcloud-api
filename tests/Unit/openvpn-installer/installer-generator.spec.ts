import { describeName, playgroundPath, testSuite } from "../../mocha/global-setup";
import path from "path";
import { FSHelper } from "../../../src/utils/fs-helper";
import { expect } from "chai";
import * as fs from "fs-extra";
import { InstallerGenerator } from "../../../src/openvpn-installer/installer-generator";
import { InvalidConnectionNameException } from "./exceptions/invalid-connection-name.exception";
import sinon from "sinon";

describe(describeName('InstallerGenerator Unit Tests'), () => {
    let workspace: string;
    let generator: InstallerGenerator;
    let connectionName: string;
    let outputPath: string;
    let stubGenerateCommand: sinon.SinonStub

    beforeEach(async () => {
        workspace = path.join(playgroundPath, "lib/nsis");
        outputPath = path.join(workspace, 'output.exe');
        await FSHelper.copy("lib/nsis-3.05", workspace);
        connectionName = "connectionTest";
        
        // @ts-ignore
        stubGenerateCommand = sinon.stub(InstallerGenerator.prototype, 'runCommand').callsFake(() => {
            fs.writeFileSync(path.join(workspace, "fwcloud-vpn", "fwcloud-vpn.exe"), "")
        });
    });

    afterEach(() => {
        fs.removeSync(workspace);
        stubGenerateCommand.restore();
    });

    describe('constructor()', () => {
        it('should throw an exception if the connection name starts with an invalid character', () => {
            let f = () => {
                generator = new InstallerGenerator(workspace, "-connection", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, " connection", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "_connection", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "$connection", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)
        });

        it('should throw an exception if the connection name ends with an invalid character', () => {
            let f = () => {
                generator = new InstallerGenerator(workspace, "connection-", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connection ", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connection_", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connection$", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connec$tion", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connec Tion", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)
        });

        it('should throw an exception if the connection name length reaches the limit', () => {
            let f = () => {
                generator = new InstallerGenerator(workspace, "connectionconnectionconnectionconnection", "", outputPath);
            }

            expect(f).to.throw(InvalidConnectionNameException)
        })

        it('should not throw an exception if the connection name is valid', () => {
            let f = () => {
                generator = new InstallerGenerator(workspace, "connect-ion", "", outputPath);
            }

            expect(f).not.to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "connect_Ion", "", outputPath);
            }

            expect(f).not.to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "1connect_Ion", "", outputPath);
            }

            expect(f).not.to.throw(InvalidConnectionNameException)

            f = () => {
                generator = new InstallerGenerator(workspace, "1connect_Ion1", "", outputPath);
            }

            expect(f).not.to.throw(InvalidConnectionNameException)
        });
    })

    describe('generate()', () => {

        it('should generate the ovpn file which filename is the connection name', () => {
            //@ts-ignore
            const removeStub = sinon.stub(InstallerGenerator.prototype, 'removeConfigFile').returns(null);
            generator = new InstallerGenerator(workspace, connectionName, "<test></test>", outputPath);

            generator.generate();


            expect(fs.existsSync(path.join(workspace, "fwcloud-vpn", connectionName + ".ovpn"))).to.be.true;
            expect(fs.statSync(path.join(workspace, "fwcloud-vpn", connectionName + ".ovpn")).isFile()).to.be.true;
            expect(fs.readFileSync(path.join(workspace, "fwcloud-vpn", connectionName + ".ovpn")).toString()).to.be.eq("<test></test>");
            removeStub.restore();
        });

        it('should remove the ovpn file after generate installer', () => {
            generator = new InstallerGenerator(workspace, connectionName, "<test></test>", outputPath);

            generator.generate();
            expect(fs.existsSync(path.join(workspace, "fwcloud-vpn", connectionName + ".ovpn"))).to.be.false;
        });

        it('should generate the exe file', () => {
            generator = new InstallerGenerator(workspace, connectionName, "<test></test>", outputPath);

            const _path: string = generator.generate();
            expect(fs.existsSync(_path)).to.be.true;
            expect(fs.statSync(_path).isFile()).to.be.true;
        });

        it('should clean files if script throws an exception', () => {
            stubGenerateCommand.restore();
            //@ts-ignore
            stubGenerateCommand = sinon.stub(InstallerGenerator.prototype, 'runCommand').callsFake(() => {
                throw new Error();
            });

            generator = new InstallerGenerator(workspace, connectionName, "<test></test>", outputPath);

            const f = () => {
                const _path: string = generator.generate();
            }
        
            expect(f).to.throw(Error);
            expect(fs.existsSync(path.join(workspace, "fwcloud-vpn", "fwcloud-vpn.exe"))).to.be.false;
            expect(fs.existsSync(path.join(workspace, "fwcloud-vpn", connectionName + ".ovpn"))).to.be.false;
        })
    });
});