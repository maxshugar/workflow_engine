#include <vector>
#include <stdio.h>

class Task
{

public:
    Task() = default;
    Task(int id);

    int state_;
    int id_;

    void addDependency(Task *dependency);
    void execute();

private:
    std::vector<Task *> dependencies_;
    std::vector<Task *> successors_;
    void notifySuccessors();
};