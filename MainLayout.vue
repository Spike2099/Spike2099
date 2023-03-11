<template>
  <!-- begin:: Body -->
  <div class="page d-flex flex-row flex-column-fluid">
    <!-- begin:: Aside Left -->
    <KTAside v-if="asideEnabled" :lightLogo="themeLightLogo" :darkLogo="themeDarkLogo" />
    <!-- end:: Aside Left -->

    <div id="kt_wrapper" class="d-flex flex-column flex-row-fluid wrapper">
      <KTHeader />

      <!-- <div id="kt_content" class="content d-flex flex-column flex-column-fluid"> -->

      <table class="table table-row-dashed table-row-gray-300 gy-7">
        <thead>
          <h1>Users Table</h1>
          <button class="btn btn-info" @click="showAddUserModal = true" data-bs-toggle="modal"
            data-bs-target="#kt_modal_1">Add Users</button>
          <tr class="fw-bolder fs-5 text-gray-800">
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
            <!--тут метка-->
              <button class="btn btn-primary hover-elevate-up" @click="showingEdit(index)" data-bs-toggle="modal"
            data-bs-target="#kt_modal_2">Edit</button>

              <button class="btn btn-light-danger" @click="deleteUser(index)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- </div> -->

      <div class="modal fade" tabindex="-1" id="kt_modal_1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Модальное Окно Добавления Пользователей</h3>
              <!--begin::Close-->
              <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                <span class="svg-icon svg-icon-1"></span>
              </div>
              <!--end::Close-->
            </div>
            <div class="modal-body">
              <div v-if="showAddUserModal">
                <div>
                  <label>First Name:</label>
                  <input type="text" v-model="newUser.firstName">
                </div>
                <div>
                  <label>Last Name:</label>
                  <input type="text" v-model="newUser.lastName">
                </div>
                <div>
                  <label>Email:</label>
                  <input type="email" v-model="newUser.email">
                </div>
                <div>
                  <button class="btn btn-primary hover-elevate-up" @click="addUser">Save</button>
                   <!-- <button @click="showAddUserModal = false">Cancel</button> -->
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>



      <div class="modal fade" tabindex="-1" id="kt_modal_2">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Модальное Окно Изменение Пользователей</h3>
                <!--begin::Close-->
                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                    <span class="svg-icon svg-icon-1"></span>
                </div>
                <!--end::Close-->
            </div>

            <div class="modal-body">
        <div v-if="showEditUserModal !== null">
        <div>
          <label>First Name:</label>
          <input type="text" v-model="editUser.firstName">
        </div>

        <div>
          <label>Last Name:</label>
          <input type="text" v-model="editUser.lastName">
        </div>

        <div>
          <label>email:</label>
          <input type="email" v-model="editUser.email">
        </div>
        <div>
          <button class="btn btn-primary hover-elevate-up" @click="saveUser">Save User</button>
         <!--<button @click="showEditUserModal = null">Cancel</button>--> 
         <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
      <KTFooter />
    </div>
  </div>
       </div>
            <div class="modal-footer">
            </div>
        </div>
    </div>
</div>

</template> 

<script>
export default {
  data() {
    return {
      users: [],
      newUser: {
        firstName: "",
        lastName: "",
        email: "",
      },
      showAddUserModal: false,
      showEditUserModal: null,
      editUser: {
        firstName: "",
        lastName: "",
        email: "",
      },
      editUserIndex: null,
    };
  },
  mounted() {
    this.loadUsersFromLocalStorage();
  },
  methods: {
    loadUsersFromLocalStorage() {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      this.users = users;
    },

    saveUsersToLocalStorage() {
      localStorage.setItem("users", JSON.stringify(this.users));
    },

    addUser() {
      this.users.push(this.newUser);
      this.saveUsersToLocalStorage();
      this.newUser = { firstName: "", lastName: "", email: "" };
      this.showAddUserModal = false;
    },

    showingEdit(index) {
      this.editUser = this.users[index];
      this.editUserIndex = index;
      this.showEditUserModal = true;
    },

    saveUser() {
      this.users.splice(this.editUserIndex, 1, this.editUser);
      this.saveUsersToLocalStorage();
      this.showEditUserModal = null;
    },

    deleteUser(index) {
      //удаляем юзера 
      this.users.splice(index, 1);

      // сохраняем в localStorage для отображения на странице со стороны клиента. 
      localStorage.setItem("users", JSON.stringify(this.users));
    },
  },
}
</script>


<style>
.btn {
  margin-left: 5px;
}


*{

  margin: 5px;
  bottom: 5px;

}
</style>