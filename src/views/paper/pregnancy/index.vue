<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="操作时间" prop="operateTime">
        <el-date-picker clearable size="small"
          v-model="queryParams.operateTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择操作时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['paper:pregnancy:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['paper:pregnancy:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['paper:pregnancy:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['paper:pregnancy:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pregnancyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="操作时间" align="center" prop="operateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['paper:pregnancy:query']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['paper:pregnancy:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['paper:pregnancy:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改pregnancy对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="850px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :xs="24" :md="12" :style="{height: '350px'}">
            <vue-cropper
              ref="cropper"
              :img="options.img"
              :info="true"
              :autoCrop="options.autoCrop"
              :autoCropWidth="options.autoCropWidth"
              :autoCropHeight="options.autoCropHeight"
              :fixedBox="options.fixedBox"
              @realTime="realTime"
            />
          </el-col>

          <el-col :xs="24" :md="12" :style="{height: '200px'}">
            <div class="pregnancy-upload-preview">
              <img :src="previews.url" :style="previews.img" />
            </div>
          </el-col>

          <div class="pregnancy-operate-bar">
            <el-col :lg="2" :md="2">
              <div class="pregnancy-chose-button">
                <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
                  <el-button size="small">
                    选择
                    <i class="el-icon-upload el-icon--right"></i>
                  </el-button>
                </el-upload>
              </div>
            </el-col>
            <el-col :lg="{span: 1, offset: 2}" :md="2">
              <el-button icon="el-icon-plus" size="small" @click="changeScale(1)"></el-button>
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :md="2">
              <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)"></el-button>
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :md="2">
              <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()"></el-button>
            </el-col>
            <el-col :lg="{span: 1, offset: 1}" :md="2">
              <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()"></el-button>
            </el-col>
          </div>
        </el-row>
        <br />
        <el-col :span="12">
          <el-form-item label="检测深度" prop="degree">
            <el-select v-model="form.degree" placeholder="请选择" style="width:100%">
              <el-option
                v-for="dict in dict.type.t_pregnancy_degree"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="检验时间" prop="operateTime">
            <el-date-picker clearable size="small"
              style= "width:100%"
              v-model="form.operateTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择检验时间">
            </el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        </el-col>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看pregnancy对话框 -->
    <el-dialog :title="title" :visible.sync="view" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="检验试纸" prop="imgFile">
<!--          <img :src="this.form.imgUrl" style="width:100%"/>-->
          <el-popover
            placement="right"
            title=""
            trigger="hover">
            <img :src="this.form.imgUrl" alt="this.form.imgUrl" style="width:200%"/>
            <img slot="reference" :src="this.form.imgUrl" :alt="this.form.imgUrl">
          </el-popover>
        </el-form-item>

        <el-form-item label="检测深度" prop="degree">
          <el-input v-model="form.degreeLabel"  readonly/>
        </el-form-item>

        <el-form-item label="检验时间" prop="operateTime">
          <el-input v-model="form.operateTime"  />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPregnancy, getPregnancy, delPregnancy, addPregnancy, updatePregnancy } from "@/api/paper/pregnancy";
import store from "@/store";
import { VueCropper } from "vue-cropper";

export default {
  components: { VueCropper },
  name: "Pregnancy",
  dicts: ['t_pregnancy_degree'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // pregnancy表格数据
      pregnancyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示详情
      view: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        operateTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      options: {
        img: 'base64', //裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 380, // 默认生成截图框宽度
        autoCropHeight: 90, // 默认生成截图框高度
        fixedBox: true // 固定截图框大小 不允许改变
      },
      previews: {}
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询pregnancy列表 */
    getList() {
      this.loading = true;
      listPregnancy(this.queryParams).then(response => {
        this.pregnancyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.view = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        imgUrl: null,
        fileId: null,
        operateTime: null,
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
        delFlag: null,
        remark: null,
        degreeLabel: null
      };
      this.options.img = null;
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加检验信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPregnancy(id).then(response => {
        this.form = response.data;
        this.options.img = this.form.imgUrl;
        this.previews.url = this.form.imgUrl;
        this.open = true;
        this.title = "修改检验信息";
      });
    },
    /** 查看按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids
      getPregnancy(id).then(response => {
        this.form = response.data;
        this.options.img = this.form.imgUrl;
        this.previews.url = this.form.imgUrl;
        this.view = true;
        this.title = "查看检验信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs.cropper.getCropData(data => {
        this.form.imgUrl = data;
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != null) {
              updatePregnancy(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            } else {
              addPregnancy(this.form).then(response => {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              });
            }
          }
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除pregnancy编号为"' + ids + '"的数据项？').then(function() {
        return delPregnancy(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('paper/pregnancy/export', {
        ...this.queryParams
      }, `pregnancy_${new Date().getTime()}.xlsx`)
    },
    // 覆盖默认的上传行为
    requestUpload() {

    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    // 上传预处理
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },
    // 实时预览
    realTime(data) {
      this.previews = data;
    }

  }
};
</script>
<style scoped lang="scss">
.pregnancy-upload-preview {
  position: absolute;
  top: 30%;
  transform: translate(6%, -20%);
  width: 380px;
  height: 90px;
  border-radius: 10px;
  //border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
.pregnancy-operate-bar{
  margin-top:30%;
}
.pregnancy-chose-button{
  margin-left:40%;
}
</style>
