class Employee{
  
  constructor(name) {
    this.name = name;
  }

  work() {
    console.log(`${this.name} is working`)
  }
}

  class Manager extends Employee{
    work() {
      console.log(`${this.name} is managing`)
    }
  }

  class Developer extends Employee{
    work() {
      console.log(`${this.name} is coding`)
    }
  }


const employees = [new Employee('Jessie'), new Manager('Mathias'), new Developer('Reggie')]
employees.forEach(employee => employee.work())