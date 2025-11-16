## Usage: make [target] ...
## -
## Targets:
.ONESHELL:
.PHONY: test

# Terraform Workspace
workspace =

# Enviroment
env =

# Outputfile for plan
planfile =

# App Docker image
application_container_image_url=

# Build variables
jira_ticket_number=
gitsha1 =

ifdef jira_ticket_number
	# Terraform Workspace
    workspace="${app_name}_pr-stage_${jira_ticket_number}"
else
	# Terraform Workspace
    workspace="${app_name}_${env}"
endif

all:		init test plan ## - targets to run

init:		clean ## - targets to run
	terraform init -upgrade

test:		init format validate ## - targets to run

clean:		## remove state file and lock.
	rm -rf .terraform .terraform.lock.hcl

fullclean:	clean ## terraform state file, plan file
	rm -rf *.tfplan

.terraform:
	make init

format:		## check if the input is formatted. Options: `fix=true`
ifdef fix
	terraform fmt
else
	terraform fmt -check
endif

validate:
	terraform validate

plan:		init workspace ## show changes required by the current configuration.
ifdef planfile
	terraform plan -refresh=true -var "app_name=${app_name}" -var "terraform_version=${terraform_version}" -out=${planfile}
else
	terraform plan -var "app_name=${app_name}" -var "terraform_version=${terraform_version}" -refresh=true
endif

apply:		workspace ## create or update infrastructure
ifdef planfile
	terraform apply ${planfile}
else
	terraform apply -refresh=true -var "app_name=${app_name}"
endif

destroyplan:	 init workspace ## show changes on destroying infrastructure
ifdef planfile
	terraform plan -destroy -refresh=true -var "app_name=${app_name}" -var "jira_ticket_number=${jira_ticket_number}" -var "terraform_version=${terraform_version}" -out=${planfile}
else
	terraform plan -destroy -refresh=true -var "app_name=${app_name}" -var "jira_ticket_number=${jira_ticket_number}" -var "terraform_version=${terraform_version}"
endif

destroy:	 init workspace ## destroy infrastructure
	terraform apply -destroy -var "application_container_image_url=no_image" -auto-approve

help:		## show this help.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

workspace: 		# switch workspace
	terraform workspace select ${workspace} || terraform workspace new ${workspace}
