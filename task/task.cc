#include "task.h"

#define STATE_IDLE 0
#define STATE_RUNNING 1
#define STATE_COMPLETE 2

Task::Task(int id)
{
    state_ = STATE_IDLE;
    id_ = id;
};

void Task::addDependency(Task *dependency)
{
    dependency->successors_.push_back(this);
    dependencies_.push_back(dependency);
}

void Task::execute()
{

    // Ensure all dependencies have completed execution.
    for (auto const &dependency : dependencies_)
    {
        if (dependency->state_ != STATE_COMPLETE)
        {
            printf("Task %d waiting for task %d to complete.\n", id_, dependency->id_);
            return;
        }
    }

    // Execute task.
    state_ = STATE_RUNNING;
    printf("Executing task %d\n", id_);
    //Task complete.
    state_ = STATE_COMPLETE;
    // Notify all successors of task completion.
    notifySuccessors();
}

void Task::notifySuccessors()
{

    for (auto const &successor : successors_)
    {
        successor->execute();
    }

    //successors_execute();
}