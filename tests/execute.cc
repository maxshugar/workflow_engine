#include <stdio.h>
#include "../task/task.h"

int main()
{

    printf("TEST 001: Execute.\n");

    Task t1(1);
    Task t2(2);
    Task t3(3);
    Task t4(4);
    t2.addDependency(&t1);
    t3.addDependency(&t1);
    t4.addDependency(&t2);
    t4.addDependency(&t3);

    t1.execute();

    return 0;
}