<template>
    <div class="chemistry">
        <div ref="table" class="table"></div>
        <div class="operation">
            <el-input
                v-model="inputValue"
                placeholder="输入药品计量(ml/g)"
                size="small"
                type="number"
            />
            <el-button size="small" type="success" @click="addInstrument('beaker')">
                烧杯 250ml
            </el-button>
            <el-button size="small" type="success" @click="addInstrument('bigTestTube')">
                大试管 100ml
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('NaOH')">
                氢氧化钠溶液 1.712mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('HCl')">
                稀盐酸溶液 2.468mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('Na2CO3')">
                碳酸钠溶液 0.768mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('Na2CO3_2')">
                碳酸钠溶液 1mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('Na2CO3_1')">
                碳酸钠溶液 1.536mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('CaCl2')">
                氯化钙溶液 2.146mol/L
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('H2O')">
                H{2}O
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('H2O')">
                H{2}O
            </el-button>
            <el-button size="small" type="primary" @click="addMedicine('CO2')">
                CO{2}
            </el-button>
        </div>
        <div ref="showBoard" class="showBoard">
            <div v-for="(arr, index) in containerInfo" :key="index" class="showChemical">
                <div v-for="obj in arr" :key="obj + index" class="oneChemical">
                    {{obj}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>

/**
 * @file 化学
 */

import {env} from '@/environment';
import Entity from '@/entity/chemistry';
import {guid} from '@/settings/utils';

// import Matter from '@/world/matter';
import Pixi from '@/world/pixi';
import ChemistryECS from '../../world/chemistry';

export default {
    name: 'Chemistry',
    data() {
        return {
            atlasUrl: [
                `${env.publicPath}/texture/chemistry/beaker.png`,
                `${env.publicPath}/texture/chemistry/bigTestTube.json`,
                `${env.publicPath}/texture/chemistry/rorateCtr.json`
            ],
            inputValue: 50,
            beaker: null,
            dataArr: [],
            medicine: {
                NaOH: {
                    entityValue: 'NaOH_Aqua'
                },
                HCl: {
                    entityValue: 'HCl_Aqua'
                },
                Na2CO3: {
                    entityValue: 'Na{2}CO{3}_Aqua'
                },
                // eslint-disable-next-line babel/camelcase
                Na2CO3_1: {
                    entityValue: 'Na{2}CO{3}_Aqua_1'
                },
                // eslint-disable-next-line babel/camelcase
                Na2CO3_2: {
                    entityValue: 'Na{2}CO{3}_Aqua_2'
                },
                CaCl2: {
                    entityValue: 'CaCl{2}_Aqua'
                },
                H2O: {
                    entityValue: 'H{2}O_Liquid'
                },
                // eslint-disable-next-line babel/camelcase
                H2O_1: {
                    entityValue: 'H{2}O_Solid'
                },
                CO2: {
                    entityValue: 'CO{2}_Gas'
                }
            }
        };
    },
    computed: {
        editedEntity() {
            return this.$store.state.chemistry.editEntity;
        },
        containerInfo() {
            return this.$store.state.chemistry.containerInfo;
        }
    },

    /**
     * 渲染层（将图形数据渲染出来） 使用Pixi.js
     * 物理层（负责更新物理逻辑：碰撞检测、力学模拟）
     * 业务层（使用ECS，解耦各个业务模块）
     */
    mounted() {
        window.PIXI = new Pixi(
            {
                atlasUrl: this.atlasUrl,
                resizeTo: this.$refs.table,
                dom: this.$refs.table,
            },
            () => {
                window.CHEMISTRY = new ChemistryECS();
                // window.MATTER = new Matter();
                this.initDone();
            }
        );
    },
    methods: {
        initDone() {
            Entity.beaker({name: 'beaker', width: 50, height: 120});
        },
        addMedicine(param) {
            if (!this.editedEntity) {
                this.$notify({message: '请先选择容器！', type: 'error'});
                return false;
            }
            if (!this.inputValue) {
                return;
            }
            const renderId = guid();
            window.CHEMISTRY.createEnities([
                {
                    ...this.medicine[param],
                    entityType: 'medicine',
                    id: renderId,
                    name: renderId,
                    cubage: +this.inputValue,
                    parentId: this.editedEntity.id
                }
            ]);
        },

        // 增加仪器方法
        addInstrument(instrumentName) {
            if (!Object.keys(Entity).includes(instrumentName)) {
                this.$notify({message: '新增容器错误！', type: 'error'});
                return false;
            }
            Entity[instrumentName]({width: 50, height: 100});
        }
    }
};
</script>

<style lang="less" scoped>
@operationWidth: 250px;

.chemistry {
    position: relative;
    width: 100%;
    height: 100%;

    .operation {
        position: absolute;
        right: 250px;
        top: 0;
        width: @operationWidth;
        height: 100%;
        overflow: auto;

        .el-button {
            display: block;
            margin: 10px;
        }

        .el-input {
            margin: 10px;
            width: 80%;
        }
    }

    .showBoard {
        position: absolute;
        right: 0;
        top: 0;
        width: @operationWidth;
        height: 100%;
        overflow: auto;
    }

    .table {
        width: calc(100% - @operationWidth * 2);
        height: 100%;
    }

    .showChemical {
        text-align: left;
        margin: 10px 20px;
    }
}
</style>
