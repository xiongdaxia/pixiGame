/**
 * 向容器中添加化学物质
 */
import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';
import StructureComponent from '@/components/chemistry/structureComponent';

/**
 * 向容器中添加新物质 或 更新容器内物质成分
 * @param {*} parentEntity 容器实体
 * @param {*} childEntities 物质实体数组
 */
const updateContainEntity = function (contains, entity) {
    const chemical = entity.getMutableComponent(ChemicalPropertyComponent);
    const {chemicalFormula, chemicalState} = chemical;
    const oldEntity = contains[chemicalFormula];
    if (oldEntity) {
        const oldChemical = oldEntity.getMutableComponent(ChemicalPropertyComponent);
        const {chemicalState: oldChemicalState} = chemical;
        if (oldChemicalState === chemicalState) {
            oldChemical.cubage += chemical.cubage;
            oldChemical.quality += chemical.quality;
            oldChemical.amountOfSubstance += chemical.amountOfSubstance;
            return;
        }
    }
    contains[chemicalFormula] = entity;
    console.log('向容器中添加新物质 或 更新容器内物质成分--', contains);
};

/**
 * 依次向容器中添加物质
 * @param {*} parentEntity 容器实体
 * @param {*} childEntities 物质实体数组
 */
const addChildEntitiesToPEntity = function (parentEntity, childEntities) {
    const structorParent = parentEntity.getMutableComponent(StructureComponent);
    const {contains: containsParent} = structorParent;
    childEntities.forEach(entity => {
        updateContainEntity(containsParent, entity);
    });
};

export {addChildEntitiesToPEntity, updateContainEntity};
