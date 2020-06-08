import createBeakerEntity from './beaker';
import createH2OEntity from './H2O';
import createOxygenEntity from './O2';
import createNitrogenEntity from './N2';
import createCO2Entity from './CO2';
import createIonNaEntity from './ionNa';
import createIonCaEntity from './ionCa';
import createIonOHEntity from './ionOH';
import createIonHEntity from './ionH';
import createIonClEntity from './ionCL';
import createIonHCO3Entity from './ionHCO3';
import createIonCO3Entity from './ionCO3';
import createCaCO3Entity from './CaCO3';
import createBigTubeEntity from './bigTestTube';

const Entities = {
    'bigTestTube': createBigTubeEntity,
    'beaker': createBeakerEntity,
    'O{2}': createOxygenEntity,
    'N{2}': createNitrogenEntity,
    'CO{2}': createCO2Entity,
    'H{2}O': createH2OEntity,
    'Na[+]': createIonNaEntity,
    'Ca[2+]': createIonCaEntity,
    'OH[-]': createIonOHEntity,
    'H[+]': createIonHEntity,
    'Cl[-]': createIonClEntity,
    'HCO{3}[-]': createIonHCO3Entity,
    'CO{3}[2-]': createIonCO3Entity,
    'CaCO{3}': createCaCO3Entity
};

export default Entities;
