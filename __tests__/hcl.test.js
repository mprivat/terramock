const hclParser = require('../hcl.js');

test('I can parse and reconstruct HCL files', async () => {
	// const source = path.join(__dirname, 'resources');
	const content = `
    # This is a comment

    locals {
        some_stuff = [
          module.test_module.id,
          module.something_else.id
        ]
    }

    module "test_module2" {
        source = "../.."
        name="value3"
        description="value4"
    }

    resource "aws_cloudwatch_log_group" "a_log_group" {
        name              = "/aws/lambda/some_test"
        retention_in_days = 7

        /*
         Let's try
         a multi-line
         comment
         */

        parent_zone_name = {
            a = "value1",
            b = "value2", # Comment
            c = "value3",
        }


        account_type = lower(replace(lookup(local.settings, "account_type", "unknown"), local.replaceRegex, local.replacement))
        account_name = replace(lower(replace(lookup(local.settings, "account_name", "unknown"), local.replaceRegex, local.replacement)), local.account_type, local.replacement)

        the_property = join(".", [local.account_name, lookup(local.parent_zone_name, lookup(local.settings, "account_type", "unknown"), "unknown")])
        
        # ...

        count = var.permission_boundary_arn_query_enabled ? 1 : 0   // Does this work?
        arn   = "x:y:z::\${data.something.someotherthing}:a/b/TheThing"      
    }
    data "aws_caller_identity" "current" {}

    module "test_module" {
        source = "../.."
        name="value1"
        description="value2"
    }`;

	const results = hclParser.parse(content);

	// Check that the parsing was not ambiguous
	expect(results.length).toBe(1);

	console.log(JSON.stringify(results[0], null, 2));

	const reconstructed = hclParser.toHCL(results[0]);

	expect(reconstructed).toBe(content);
});

test('I can parse, scrub and reconstruct HCL files', async () => {
	// const source = path.join(__dirname, 'resources');
	const content = `
    # This is a comment

    module "test_module2" {
        source = "../.."
        name="value3"
        description=aws_cloudwatch_log_group.a_log_group.some_property
        xyz = "abc\${module.test_module.arn}ghi"
    }

    resource "aws_cloudwatch_log_group" "a_log_group" {
        name              = "/aws/lambda/some_test"
        retention_in_days = 7
        the_property = join(".", [local.account_name, lookup(local.parent_zone_name, lookup(local.settings, "account_type", "unknown"), "unknown")])
        count = var.permission_boundary_arn_query_enabled ? 1 : 0   // Does this work?
        arn   = "x:y:z::\${data.something.someotherthing}:a/b/TheThing"      
    }

    data "aws_caller_identity" "current1" {}

    module "test_module" {
        source = "../.."
        name="value1"
        description="value2"        
    }
    
    data "aws_caller_identity" "current2" {}
    `;

	const reconstructed = hclParser.copyAndMock(content, {
		'module.test_module': { arn: 'def' },
		'resource.aws_cloudwatch_log_group.a_log_group': { some_property: 'some-id' }
	});

	const expected = `
    # This is a comment

    module "test_module2" {
        source = "../.."
        name="value3"
        description="some-id"
        xyz = "abcdefghi"
    }

    

    data "aws_caller_identity" "current1" {}

    
    
    data "aws_caller_identity" "current2" {}
    `;

	expect(reconstructed).toBe(expected);
});
