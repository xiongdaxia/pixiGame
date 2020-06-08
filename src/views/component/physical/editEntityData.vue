<template>
    <div
        v-show="editPageVisible"
        class="container"
        :style="{ top: editBoxPositionY + 'px', left: editBoxPositionX + 'px' }"
    >
        <div class="edit-entity-container">
            <i class="el-icon-edit" @click="editEntity"></i>
            <i class="el-icon-delete" @click="deleteEntity"></i>
        </div>
        <div v-if="editBoxVisible" class="edit-page">
            <el-form v-model="form" size="small">
                <el-form-item
                    v-for="(item, index) in formData"
                    :key="index"
                    :label="item.label"
                    label-width="90px"
                >
                    <el-input v-model="form[item.combainkey]">
                        <template slot="append">
                            {{item.unit}}
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import components from '@/components/physical';

import {Form, FormItem, Input} from 'element-ui';
import Vue from 'vue';

const {
    ElecApplianceComponent,
    ElecFieldComponent,
    MagneticFieldComponent,
    MatterDataComponent,
    ComplexEntityComponent
} = components;

Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Input.name, Input);

export default {
    name: 'EditEntityData',
    props: {},

    data() {
        return {
            // 编辑的初始信息
            formData: [],
            // 编辑页面的表单
            form: {}
        };
    },
    computed: {
        editPageVisible() {
            return this.$store.state.physical.editPageVisible;
        },
        editBoxVisible() {
            return this.$store.state.physical.editBoxVisible;
        },
        editBoxPositionX() {
            return this.$store.state.physical.editBoxPosition.x;
        },
        editBoxPositionY() {
            return this.$store.state.physical.editBoxPosition.y;
        },
        editedEntity() {
            return this.$store.state.physical.editEntity;
        }
    },
    watch: {
        // 可编辑框数据改变后，更新实体数据，并开始电路计算
        form: {
            handler(val) {
                if (this.editedEntity.hasComponent(ComplexEntityComponent)) {
                    // 复杂实体
                    const child = this.editedEntity.getMutableComponent(
                        ComplexEntityComponent
                    ).contains;
                    const props = {};
                    child.forEach(entity => {
                        props[entity.id] = entity.getMutableComponent(ElecApplianceComponent);
                    });
                    Object.keys(val).forEach(item => {
                        const split = item.split('_');
                        props[split[0]][split[1]] = +val[item];
                        // 更新editInfo
                        props[split[0]].editInfo.forEach(info => {
                            if (info.key === split[1]) {
                                console.log(item, val);
                                info.value = +val[item];
                            }
                        });
                    });

                    this.$store.commit('runCircuitCompute');
                    return false;
                }
                if (this.editedEntity.hasComponent(ElecApplianceComponent)) {
                    // 电路的简单实体
                    const data = this.editedEntity.getMutableComponent(
                        ElecApplianceComponent
                    );
                    Object.keys(val).forEach(item => {
                        const split = item.split('_');
                        data[split[1]] = +val[item];
                        // 更新editInfo
                        data.editInfo.forEach(info => {
                            if (info.key === split[1]) {
                                info.value = +val[item];
                            }
                        });
                    });
                    this.$store.commit('runCircuitCompute');
                    return false;
                }

                if (this.editedEntity.hasComponent(ElecFieldComponent)) {
                    const data = this.editedEntity.getMutableComponent(ElecFieldComponent);

                    Object.keys(val).forEach(item => {
                        const split = item.split('_');
                        data.E[split[1]] = +val[item];
                        // 更新editInfo
                        data.editInfo.forEach(info => {
                            if (info.key === split[1]) {
                                info.value = +val[item];
                            }
                        });
                    });

                }
                if (this.editedEntity.hasComponent(MagneticFieldComponent)) {
                    const data = this.editedEntity.getMutableComponent(MagneticFieldComponent);

                    Object.keys(val).forEach(item => {
                        const split = item.split('_');
                        data.B[split[1]] = +val[item];
                        // 更新editInfo
                        data.editInfo.forEach(info => {
                            if (info.key === split[1]) {
                                info.value = +val[item];
                            }
                        });
                    });
                }

                if (this.editedEntity.hasComponent(MatterDataComponent)) {
                    const data = this.editedEntity.getMutableComponent(MatterDataComponent);

                    Object.keys(val).forEach(item => {
                        const split = item.split('_');
                        data.params.velocity[split[1]] = +val[item];
                        // 更新editInfo
                        data.editInfo.forEach(info => {
                            if (info.key === split[1]) {
                                info.value = +val[item];
                            }
                        });
                    });
                }
            },
            deep: true
        }
    },
    methods: {
        // ======================事件处理函数======================
        // 点击编辑按钮
        editEntity() {
            console.log('开始编辑，当前编辑的实体是：', this.editedEntity);
            this.formData = [];
            this.form = {};
            if (this.editedEntity.hasComponent(ComplexEntityComponent)) {
                // 复杂实体
                const child = this.editedEntity.getComponent(ComplexEntityComponent)
                    .contains;
                child.forEach(entity => {
                    const data = entity.getComponent(ElecApplianceComponent);
                    let temp = data ? data.editInfo || [] : [];
                    temp = temp.map(item => {
                        item.combainkey = `${entity.id}_${item.key}`;
                        return item;
                    });
                    this.formData.push(...temp);
                    this.formData.forEach(item => {
                        this.$set(this.form, item.combainkey, item.value);
                    });
                });
                this.$store.commit('updateEditBoxVisible', true);
                return false;
            }

            // 简单实体
            if (this.editedEntity.hasComponent(ElecApplianceComponent)) {
                const data = this.editedEntity.getComponent(ElecApplianceComponent);
                this.formData = data ? data.editInfo || [] : [];
            }


            if (this.editedEntity.hasComponent(ElecFieldComponent)) {
                const data = this.editedEntity.getComponent(ElecFieldComponent);
                this.formData = data ? data.editInfo || [] : [];
            }
            if (this.editedEntity.hasComponent(MagneticFieldComponent)) {
                const data = this.editedEntity.getComponent(MagneticFieldComponent);
                this.formData = data ? data.editInfo || [] : [];
            }
            if (this.editedEntity.hasComponent(MatterDataComponent)) {
                const data = this.editedEntity.getMutableComponent(MatterDataComponent);
                this.formData = data ? data.editInfo || [] : [];
            }

            this.formData = this.formData.map(item => {
                item.combainkey = `${this.editedEntity.id}_${item.key}`;
                return item;
            });
            this.formData.forEach(item => {
                this.$set(this.form, item.combainkey, item.value);
            });
            this.$store.commit('updateEditBoxVisible', true);
        },
        // 点击删除按钮
        deleteEntity() {
            console.log('开始删除，当前删除的实体是：', this.editedEntity);
            this.$store.commit('updateEditBoxVisible', false);
            this.$store.commit('updateEditPageVisible', false);
            this.editedEntity.remove();
        }
    }
};
</script>

<style lang="less" scoped>
.container {
  position: absolute;
  display: inline-block;
  width: auto;
}

.edit-entity-container {
  display: inline-block;
  position: absolute;
  height: 100px;
  width: 50px;
  border-radius: 25px;
  background-color: black;
  top: 0;

  i {
    color: white;
    font-size: 28px;
    width: 50px;
    height: 50px;
    display: block;
    text-align: center;
    line-height: 50px;
  }
}


</style>

<style lang="less">
.edit-page {
  display: inline-block;
  border-radius: 15px;
  color: white;
  position: absolute;
  top: 0;
  left: 60px;
  padding-top: 10px;
  padding-right: 10px;
  background-color: #1e1e1e;
  width: 250px;
  .el-form-item__label{
      color:white!important;
  }
}
</style>
