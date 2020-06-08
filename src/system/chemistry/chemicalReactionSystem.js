/**
 * @file 离子反应
 */

import {System} from 'ecsy';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

import {REACTION_FORMULAR} from '@/settings/chemistry';

import {
    updateEntityQuantity,
    createEntityBySubstance
} from './common/updateEntityQuantity';

class ChemicalReactionSystem extends System {
    init() {
        console.log('计算 化学反应 系统init');
    }

    execute() {
        const entities = this.queries.Reaction.results;
        entities.forEach(entity => {
            const vessel = entity.getMutableComponent(ReactionVesselComponent);
            const {cubage: totalCubage, availableCubage} = vessel;
            const structure = entity.getMutableComponent(StructureComponent);
            const {contains} = structure;
            const reatants = this.findReactants(contains);
            if (reatants) {
                this.updateReactantAndProduct(reatants, contains, totalCubage - availableCubage);
            }

        });
    }

    /**
     * 判断容器中是否有反应进行，并返回反应物
     * @param {*} contains 容器
     */
    findReactants(contains) {
        // 遍历反应容器中的所有物质，判断是否有可反应物质
        const chemicalArr = Object.keys(contains);
        const reactions = REACTION_FORMULAR.filter(item => {
            const flag = item.reactant.every(reactant => chemicalArr.includes(reactant));
            return flag;
        });
        if (reactions && reactions.length > 0) {
            return reactions;
        }
        return false;
    }

    /**
     * 计算当前反应速率
     * @param {*} reaction
     * @param {*} contains
     */
    calculateReactionRate(reaction, contains) {
        const {reactant, reactionRateCoefficient} = reaction;
        let temp = 25;
        const result = reactant.map(react => {
            const ent = contains[react];
            if (ent) {
                const chemical = ent.getMutableComponent(ChemicalPropertyComponent);
                const {concentration, temperature} = chemical;
                temp = temperature;
                return concentration;
            }
        });
        let reactionRate = reactionRateCoefficient + 0.001 * (temp - 25);
        result.forEach(item => {
            reactionRate *= item;
        });
        return reactionRate;
    }

    /**
     * 计算反应过程，更新反应物/生成物的量
     * @param {*} reactions
     * @param {*} contains
     * @param {*} cubage
     */
    updateReactantAndProduct(reactions, contains, cubage) {
        if (!cubage || cubage < 0) {
            console.error('当前容器剩余容积小于0！！！');
        }
        reactions.forEach(reaction => {
            const {reactant, reactantCount, product, productCount, condition} = reaction;
            if (condition && condition.length > 0) {
                console.log('有反应条件！');
            }
            else {
                // 计算反应速率
                const reactionRate = this.calculateReactionRate(reaction, contains);
                // 每一秒反应消耗的物质的量
                let reacMount = reactionRate * (cubage / 1000);
                const leastReact = Infinity;
                reactant.forEach((react, index) => {
                    const ent = contains[react];
                    const chemical = ent.getMutableComponent(ChemicalPropertyComponent);
                    const {amountOfSubstance} = chemical;
                    if (amountOfSubstance / reactantCount[index] < leastReact) {
                        reacMount = amountOfSubstance / reactantCount[index];
                    }
                });
                reactant.forEach((react, index) => {
                    const ent = contains[react];
                    if (ent) {
                        const chemical = ent.getMutableComponent(ChemicalPropertyComponent);
                        if (chemical.amountOfSubstance - reacMount * reactantCount[index] > 0.00001) {
                            updateEntityQuantity({
                                entity: ent,
                                changeSubstance: -reacMount * reactantCount[index],
                                solutionCubage: cubage
                            });
                        }
                        else {
                            delete contains[react];
                        }
                    }
                });
                product.forEach((product, index) => {
                    const pro = contains[product];
                    if (pro) {
                        updateEntityQuantity({
                            entity: pro,
                            changeSubstance: reacMount * productCount[index],
                            solutionCubage: cubage
                        });
                    }
                    else {
                        const newEntity = createEntityBySubstance({
                            chemicalFormula: product,
                            chemicalState: reaction.productState[index],
                            amountOfSubstance: reacMount * productCount[index],
                            solutionCubage: cubage
                        });
                        contains[product] = newEntity;
                    }
                });
            }
        });
    }
}

ChemicalReactionSystem.queries = {
    Reaction: {
        components: [ReactionVesselComponent, StructureComponent]
    }
};

export default ChemicalReactionSystem;
